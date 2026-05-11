import { redirect } from 'react-router'

export function loader(): Response {
  throw redirect('/marketplace')
}
