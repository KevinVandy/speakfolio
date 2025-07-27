import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/finish-sign-up')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/finish-sign-up"!</div>
}
