import React from 'react'

type Props = {pdfUrl: string}

const PDFViewer = ({pdfUrl}: Props) => {
  return (
    <iframe src={`https://docs.google.com/gview?url=${pdfUrl}&embedded=true`} className='rounded-xl w-full h-full'>

    </iframe>
  )
}

export default PDFViewer