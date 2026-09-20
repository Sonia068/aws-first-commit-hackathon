import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui'

export default function NotFound() {
  return (
    <div className="container-page py-20">
      <EmptyState title="Page not found" message="The page you're looking for doesn't exist or has moved." action={<Link to="/" className="btn-primary">Go home</Link>} />
    </div>
  )
}
