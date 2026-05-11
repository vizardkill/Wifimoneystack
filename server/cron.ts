import cron from 'node-cron'

const writeStdout = (msg: string): void => {
  process.stdout.write(`${msg}\n`)
}

// Placeholder: reminder notifications are not part of the marketplace MVP.
// This job can be extended when order/notification features are implemented.
let isReminderJobRunning = false
let isWatchRenewalJobRunning = false

const runReminderJob = async (): Promise<void> => {
  if (isReminderJobRunning) {
    return
  }
  isReminderJobRunning = true
  try {
    writeStdout('[CRON] Reminder job — marketplace MVP: no-op.')
  } finally {
    isReminderJobRunning = false
  }
}

/**
 * Job que corre cada minuto. Placeholder para el MVP del marketplace.
 * Se crea sin arrancar (createTask) para que server.ts haga .start() en el primario.
 */
export const reminderCron = cron.createTask(
  '* * * * *',
  () => {
    void runReminderJob()
  },
  { noOverlap: true }
)

const runWatchRenewalJob = async (): Promise<void> => {
  if (isWatchRenewalJobRunning) {
    return
  }
  isWatchRenewalJobRunning = true
  try {
    writeStdout('[CRON-WATCH] Watch renewal job — marketplace MVP: no-op.')
  } finally {
    isWatchRenewalJobRunning = false
  }
}

/**
 * Job que corre cada 6 horas. Placeholder para el MVP del marketplace.
 */
export const watchRenewalCron = cron.createTask(
  '0 */6 * * *',
  () => {
    void runWatchRenewalJob()
  },
  { noOverlap: true }
)
