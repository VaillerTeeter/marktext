import DOMPurify from 'dompurify'

const sanitize = DOMPurify.sanitize
const isValidAttribute = DOMPurify.isValidAttribute

export { isValidAttribute }

export default sanitize
