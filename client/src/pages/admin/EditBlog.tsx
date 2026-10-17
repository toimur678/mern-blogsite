import { useParams } from 'react-router-dom'
import ArticleComposer from '../../components/admin/ArticleComposer'
const EditBlog = () => {
  const { id } = useParams<{ id: string }>()
  return <ArticleComposer key={id} id={id} />
}
export default EditBlog
