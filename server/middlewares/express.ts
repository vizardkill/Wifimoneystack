import type { NextFunction, Request, Response } from 'express'
import NodeCache from 'node-cache'

interface CustomError extends Error {
  status?: number
}

const writeSecurityLog = (message: string, details: Record<string, unknown>, isError = false): void => {
  const line = `${message} ${JSON.stringify(details)}\n`
  if (isError) {
    process.stderr.write(line)
    return
  }
  process.stdout.write(line)
}

const getClientIp = (req: Request): string => {
  const forwardedFor = req.headers['x-forwarded-for']

  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    const [firstIp] = forwardedFor.split(',')
    const normalizedIp = firstIp.trim()
    if (normalizedIp && normalizedIp.length > 0) {
      return normalizedIp
    }
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    const normalizedIp = forwardedFor[0]?.trim()
    if (normalizedIp && normalizedIp.length > 0) {
      return normalizedIp
    }
  }

  return req.ip || req.socket.remoteAddress || 'unknown'
}

const stripQueryString = (value: string): string => {
  const queryIndex = value.indexOf('?')
  return queryIndex >= 0 ? value.slice(0, queryIndex) : value
}

const safelyDecodePath = (value: string, maxDepth = 3): string[] => {
  const results = new Set<string>([value])
  let current = value

  for (let index = 0; index < maxDepth; index += 1) {
    try {
      const decoded = decodeURIComponent(current)
      if (decoded === current) {
        break
      }
      results.add(decoded)
      current = decoded
    } catch {
      break
    }
  }

  return Array.from(results)
}

const getNormalizedPathCandidates = (req: Request): string[] => {
  const rawPath = stripQueryString(req.originalUrl || req.url || req.path || '')

  return safelyDecodePath(rawPath)
    .flatMap((candidate) => {
      const normalizedSlash = candidate.replaceAll('\\', '/')
      return [candidate, normalizedSlash]
    })
    .map((candidate) => candidate.toLowerCase())
}

const errorHandlerMiddleware = (err: CustomError, req: Request, res: Response): void => {
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' })
}

// Middleware para bloquear requests con método PROPFIND (WebDAV)
const blockPropfindMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.method === 'PROPFIND') {
    res.status(405).json({ message: 'Method PROPFIND not allowed' })
    return
  }
  next()
}

const suspiciousIPCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 })
const bannedIPCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 })

const suspiciousIPRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const clientIP = getClientIp(req)

  if (bannedIPCache.has(clientIP)) {
    writeSecurityLog(
      '🚫 [SECURITY] Banned IP attempted access:',
      {
        ip: clientIP,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      },
      true
    )
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  next()
}

const blockBadBotsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const { path, method, headers } = req
  const userAgent = headers['user-agent'] || ''
  const clientIP = getClientIp(req)

  const safeAPIPaths = ['/api/v1/']

  if (safeAPIPaths.some((safePath) => path.toLowerCase().startsWith(safePath.toLowerCase()))) {
    next()
    return
  }

  const allowedPaths = ['/assets/', '/build/', '/public/', '/favicon.ico', '/robots.txt', '/sitemap.xml']

  if (allowedPaths.some((allowed) => path.toLowerCase().startsWith(allowed.toLowerCase()))) {
    next()
    return
  }

  const allowedUserAgents = [
    'googlebot', // Google Search
    'bingbot', // Microsoft Bing
    'duckduckbot', // DuckDuckGo
    'slackbot', // Slack link preview
    'facebookexternalhit', // Facebook link preview (antiguo)
    'meta-externalagent', // Meta/Facebook link preview (nuevo 2021+)
    'facebookbot', // Facebook bot genérico
    'whatsapp', // WhatsApp link preview
    'telegrambot', // Telegram link preview
    'discordbot', // Discord link preview
    'linkedinbot', // LinkedIn crawler
    'pinterestbot', // Pinterest
    'redditbot', // Reddit
    'slurp', // Yahoo
    'baiduspider', // Baidu (China)
    'yandexbot', // Yandex (Russia)
    'lighthouse', // Google Lighthouse (performance testing)
    'pagespeed', // Google PageSpeed Insights
    'gtmetrix', // GTmetrix performance
    'pingdom', // Pingdom monitoring
    'uptimerobot', // UptimeRobot monitoring
    'newrelic', // New Relic monitoring
    'datadog', // Datadog monitoring
    'postman', // Postman API testing (si lo usas)
    'insomnia', // Insomnia API testing
    'vercel-', // Vercel bots
    'netlify-', // Netlify bots
    'github-', // GitHub Actions
    'gitlab-' // GitLab CI
  ]

  const isAllowedUserAgent = allowedUserAgents.some((agent) => userAgent.toLowerCase().includes(agent.toLowerCase()))

  if (isAllowedUserAgent) {
    next()
    return
  }

  const blockedPatterns = [
    '/cgi-bin',
    'xmlrpc.php',
    '/global-protect',
    '/globalprotect',
    '/sslvpn',
    '/ssl-vpn',
    '/wp-admin',
    '/wp-login',
    '/wp-content',
    '/wp-includes',
    '/wp-json',
    '/wordpress',
    '/blog/wp-',
    '/site/wp-',
    '/cms/wp-',
    '/.env',
    '.env',
    'c:/program files',
    'c:/windows',
    '/phpmyadmin',
    '/phpMyAdmin',
    '/pma',
    '/mysql',
    '/adminer.php',
    '/adminer',
    '/phpinfo.php',
    '/phpinfo',
    '/php_info',
    '/info.php',
    '/test.php',
    '/shell.php',
    '/config.php',
    '/database.php',
    '/db.php',
    '/vendor/phpunit',
    '/phpunit',
    '/lib/phpunit',
    '/laravel/vendor/phpunit',
    '/www/vendor/phpunit',
    '/ws/vendor/phpunit',
    '/yii/vendor/phpunit',
    'eval-stdin.php',
    '/Util/PHP/eval-stdin.php',
    'allow_url_include',
    'auto_prepend_file',
    'php://input',
    'php://filter',
    'data://',
    'expect://',
    '/server-status',
    '/server-info',
    '/cpanel',
    '/cPanel',
    '/webmail',
    '/admin.php',
    '/administrator',
    '/controlpanel',
    '/dns-query',
    '/query',
    '/resolve',
    '/RDWeb',
    '/rdp',
    '/remote',
    '/vpn',
    '/.git',
    '/.svn',
    '/.hg',
    '/.bzr',
    '/composer.json',
    '/package.json.backup',
    '/.htaccess',
    '/.htpasswd',
    '/web.config',
    '/.user.ini',
    '/backup',
    '/backups',
    '/.backup',
    '/dump.sql',
    '/database.sql',
    '/.sql',
    '/backup.zip',
    '/backup.tar',
    '/backup.tar.gz',
    '/rest/config',
    '/graphql/config',
    '/upload.php',
    '/uploadify.php',
    '/fckeditor',
    '/ckeditor',
    '/solr/admin',
    '/jenkins',
    '/actuator',
    '/jolokia',
    '/license.txt',
    '/readme.html',
    '/install.php',
    '/setup.php',
    '/update.php',
    '/hello.world',
    '/test',
    '/demo',
    '/../',
    '..\\',
    '%2e%2e',
    '%252e%252e',
    '..%2f',
    '%2e%2e/',
    '%2e%2e%2f',
    '/bin/sh',
    '/bin/bash'
  ]

  const suspiciousLegacyExtensions = ['.php', '.asp', '.aspx', '.jsp', '.cgi', '.esp']

  // User-Agents maliciosos conocidos (actualizado 2025)
  const blockedUserAgents = [
    // === Scanners de Vulnerabilidades ===
    'sqlmap', // SQL injection scanner
    'nikto', // Web server scanner
    'nmap', // Network mapper
    'masscan', // Fast port scanner
    'acunetix', // Web vulnerability scanner
    'netsparker', // Web application security scanner
    'burpsuite', // Burp Suite scanner
    'metasploit', // Penetration testing framework
    'havij', // SQL injection tool
    'zgrab', // Internet-wide scanner (Censys)
    'zmap', // Fast internet scanner
    'shodan', // IoT search engine scanner
    'censys', // Internet scan project
    'dirbuster', // Directory brute forcing
    'dirb', // Web content scanner
    'wpscan', // WordPress vulnerability scanner
    'joomscan', // Joomla scanner
    'openvas', // Vulnerability scanner
    'nessus', // Vulnerability assessment

    // === Exploitation Tools ===
    'sqlninja', // SQL Server exploitation
    'havij', // Automated SQL injection
    'pangolin', // SQL injection tool
    'w3af', // Web application attack framework
    'webscarab', // Web app security testing
    'paros', // Web proxy
    'zaproxy', // OWASP ZAP
    'arachni', // Web security scanner
    'vega', // Web security scanner
    'skipfish', // Active web security scanner
    'wapiti', // Web vulnerability scanner
    'grabber', // Web application scanner
    'grendel-scan', // Web security testing
    'x-scan', // Security scanner
    'blackwidow', // Website scanner

    // === Scripting/Automation (versiones antiguas sospechosas) ===
    'python-requests/2.6', // Versión antigua usada por scrapers
    'python-urllib', // Urllib básico (sin versión)
    'python-httpx', // Cliente HTTP sospechoso
    'Go-http-client/1.1', // Cliente Go genérico
    'Go-http-client/2.0',
    'curl/7.', // cURL versiones antiguas (7.x)
    'wget/1.', // Wget antiguo
    'libwww-perl', // Perl LWP (común en bots)
    'python-requests/1.', // Requests antiguo

    // === Scrapers y Bots Maliciosos ===
    'scrapy', // Framework de scraping
    'mechanize', // Automatización web
    'selenium', // Automatización navegador (cuando no es legítimo)
    'puppeteer', // Headless Chrome automation
    'phantomjs', // Headless browser
    'headless', // Navegadores headless genéricos
    'bot', // Término genérico bot
    'crawler', // Término genérico crawler
    'spider', // Término genérico spider
    'scraper', // Término genérico scraper
    'extractor', // Extractores de contenido
    'harvest', // Harvesters de email/data
    'collector', // Data collectors

    // === DDoS y Flood Tools ===
    'slowhttptest', // Slow HTTP DoS
    'slowloris', // Slow DoS attack
    'hulk', // HTTP Unbearable Load King
    'torshammer', // Slow POST DoS
    'goldeneye', // HTTP DoS tool
    'xerxes', // DoS tool
    'pyloris', // Scriptable HTTP DoS
    'thc-', // The Hacker's Choice tools
    'loic', // Low Orbit Ion Cannon
    'hoic', // High Orbit Ion Cannon

    // === Reconnaissance Tools ===
    'whatweb', // Web technology identifier
    'wappalyzer', // Technology profiler
    'builtwith', // Technology lookup
    'netcraft', // Web server survey
    'httprint', // Web server fingerprinting
    'hping', // Network testing tool
    'fierce', // DNS reconnaissance
    'dnsrecon', // DNS enumeration
    'sublist3r', // Subdomain enumeration
    'amass', // Attack surface mapping
    'recon-ng', // Reconnaissance framework
    'theharvester', // Email/subdomain harvester
    'maltego', // OSINT tool

    // === Specific Attack Tools ===
    'commix', // Command injection exploiter
    'fimap', // LFI/RFI scanner
    'dotdotpwn', // Directory traversal
    'jbrofuzz', // Web fuzzer
    'fuzz', // Generic fuzzers
    'brutus', // Brute force tool
    'hydra', // Network login cracker
    'medusa', // Parallel login bracker
    'cain', // Password recovery tool
    'john', // John the Ripper

    // === AI/ML Scrapers (nuevos 2024-2025) ===
    'gptbot', // OpenAI scraper
    'chatgpt-user', // ChatGPT scraper
    'claudebot', // Anthropic Claude
    'cohere-ai', // Cohere AI
    'anthropic-ai', // Anthropic scrapers
    'perplexity', // Perplexity AI
    'omgili', // OMGili bot
    'dataforseo', // SEO data scraper
    'ahrefsbot', // Ahrefs (puede ser legítimo, pero agresivo)
    'semrushbot', // SEMrush (puede ser legítimo)
    'mj12bot', // Majestic crawler (muy agresivo)
    'blexbot', // BLEXBot crawler
    'dotbot', // Moz crawler (agresivo)
    'petalbot', // Huawei crawler (muy agresivo)
    'bytedance', // TikTok/ByteDance crawler
    'twitterbot', // Twitter scraper (a veces malicioso)
    'applebot', // Apple crawler (puede ser legítimo)

    // === Malware y Backdoors ===
    'morfeus', // Backdoor scanner
    'nsauditor', // Network security auditor
    'core-project', // CORE Impact
    'canvas', // CANVAS framework
    'immunity', // Immunity CANVAS
    'metasploit', // Metasploit Framework
    'beef', // Browser Exploitation Framework
    'xsser', // XSS exploitation tool
    'weevely', // Web shell
    'china.z', // Chinese malware variants
    'ZmEu', // Malware scanner

    // === Términos Genéricos Sospechosos ===
    'scanning',
    'scan',
    'probe',
    'test',
    'security',
    'attack',
    'exploit',
    'injection',
    'shell',
    'backdoor',
    'trojan',
    'virus',
    'malware',
    'ransomware',
    'cryptominer',
    'botnet',

    // === Headers/Frameworks Sospechosos ===
    'joomla', // CMS Joomla en UA (raro)
    'drupal', // CMS Drupal en UA (raro)
    'wordpress', // WordPress en UA (sospechoso)
    'wp-', // WordPress tools
    'apache-httpclient', // Java HTTP client (común en bots)
    'jakarta commons', // Jakarta HTTP (común en bots)
    'jersey/', // JAX-RS client

    // === Cloud/VPS Scanners (2024-2025) ===
    'aws-cli', // AWS CLI automation
    'gcloud', // Google Cloud CLI
    'azure-cli', // Azure CLI
    'digitalocean', // DO automation
    'linode', // Linode automation
    'vultr', // Vultr automation

    // === Copyright/Content Thieves ===
    'copyscape', // Plagiarism checker (agresivo)
    'turnitin', // Plagiarism detector
    'grapeshot', // Content classification
    'linguee', // Translation scraper
    'deepl', // Translation service scraper

    'mozilla/4.0 (compatible; msie', // Fake old IE muy antiguo (sospechoso en 2025)
    'user-agent:', // Malformed header
    '<script', // XSS attempt in UA
    'javascript:', // JavaScript injection
    'onerror=', // XSS event handler
    'onload=', // XSS event handler
    'eval(', // Code injection
    'select * from', // SQL injection específico
    'union select', // SQL injection específico
    'drop table', // SQL injection específico
    '../../../', // Path traversal (3+ niveles)
    '..\\..\\..\\', // Path traversal Windows
    'etc/passwd', // File inclusion attempt
    '/bin/bash', // Command injection attempt
    'cmd.exe', // Windows command injection
    'powershell' // PowerShell injection
  ]

  const fullPath = path + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '')
  const normalizedPathCandidates = getNormalizedPathCandidates(req)
  const matchedBlockedPathPattern = blockedPatterns.find((pattern) => normalizedPathCandidates.some((candidate) => candidate.includes(pattern.toLowerCase())))
  const matchedLegacyExtension = suspiciousLegacyExtensions.find((extension) => normalizedPathCandidates.some((candidate) => candidate.endsWith(extension)))
  const isBlockedPath = Boolean(matchedBlockedPathPattern || matchedLegacyExtension)
  const isBlockedUserAgent = blockedUserAgents.some((agent) => userAgent.toLowerCase().includes(agent.toLowerCase()))

  if (isBlockedPath || isBlockedUserAgent) {
    const suspiciousCount = (suspiciousIPCache.get<number>(clientIP) || 0) + 1
    suspiciousIPCache.set(clientIP, suspiciousCount)

    const matchedPattern = isBlockedPath
      ? (matchedBlockedPathPattern ?? matchedLegacyExtension)
      : blockedUserAgents.find((a) => userAgent.toLowerCase().includes(a.toLowerCase()))

    writeSecurityLog('🚨 [SECURITY] Blocked suspicious request:', {
      ip: clientIP,
      path: fullPath,
      normalizedPathCandidates,
      method,
      userAgent,
      attempts: suspiciousCount,
      timestamp: new Date().toISOString(),
      reason: isBlockedPath ? 'Blocked Path Pattern' : 'Blocked User-Agent',
      matchedPattern: matchedPattern,
      severity: suspiciousCount >= 3 ? 'HIGH' : suspiciousCount >= 2 ? 'MEDIUM' : 'LOW'
    })

    if (suspiciousCount >= 3) {
      bannedIPCache.set(clientIP, true)
      writeSecurityLog(
        '🔒 [SECURITY] IP BANNED for 24h due to suspicious activity:',
        {
          ip: clientIP,
          attempts: suspiciousCount,
          lastAttempt: fullPath
        },
        true
      )
    }

    res.status(404).json({ message: 'Not Found' })
    return
  }

  const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']
  if (!allowedMethods.includes(method)) {
    const methodCount = (suspiciousIPCache.get<number>(`${clientIP}_method`) || 0) + 1
    suspiciousIPCache.set(`${clientIP}_method`, methodCount)

    writeSecurityLog('🚨 [SECURITY] Blocked unusual HTTP method:', {
      ip: clientIP,
      method,
      path,
      userAgent,
      attempts: methodCount
    })

    if (methodCount >= 2) {
      bannedIPCache.set(clientIP, true)
      writeSecurityLog(
        '🔒 [SECURITY] IP BANNED due to unusual HTTP methods:',
        {
          ip: clientIP,
          attempts: methodCount
        },
        true
      )
    }

    res.status(405).json({ message: 'Method Not Allowed' })
    return
  }

  next()
}

export { errorHandlerMiddleware, blockPropfindMiddleware, blockBadBotsMiddleware, suspiciousIPRateLimiter }
