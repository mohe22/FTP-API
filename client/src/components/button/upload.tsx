import {  UploadCloud } from 'lucide-react';
import { Button } from '../ui/button';
import UploadForm from '../forms/upload';
import useModal from '@/hooks/use-model';
import { useEffect } from 'react';
import {  useUpload } from '@/hooks/use-upload';
import TransferStatus from '../transfer-status';

export default function Upload() {
  const [model, showModal, isOpen] = useModal();
  const { loading, handleUpload } = useUpload();

  const getFirstActiveFileLoading = Object.values(loading).find(
    (file) => file.loading === true
  )

  useEffect(() => {
    console.log(loading);
  }, [loading]);

  const handleModal = () => {
    showModal(
      'Upload File',
      'Select a file to upload. Supported formats: .jpg, .png, .pdf, etc.',
      (onClose) => (
        <UploadForm onclose={onClose} handleDownload={handleUpload} />
      )
    );
  };


  return (
    <div className='mx-1'>
      <Button onClick={handleModal} size={'sm'}>
      <UploadCloud className="size-5 lg:flex hidden" />
      <span className="mb-0.5">Upload</span>
      </Button>

      {isOpen ? (
      <div>{model}</div>
      ) :getFirstActiveFileLoading && (
        
      <TransferStatus 
        mainItem={getFirstActiveFileLoading}
        Items={Object.values(loading)} 
      />
      )}
    </div>
  );
}