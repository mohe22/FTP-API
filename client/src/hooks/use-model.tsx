
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogClose, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useCallback, useMemo, useState,JSX } from "react";

export default function useModal(): [
  JSX.Element | null,
  (
    title?: string | null, 
    description?: string | null, 
    getContent?: (onClose: () => void) => JSX.Element,
  ) => void,
  boolean
] {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title?: string | null;
    description?: string | null;
    content?: JSX.Element;
  } | null>(null);

  const onClose = useCallback(() => {
    setIsOpen(false);
    setModalContent(null);
  }, []);

  const showModal = useCallback(
    (
      title?: string | null,
      description?: string | null,
      getContent?: (onClose: () => void) => JSX.Element,

    ) => {
      setIsOpen(true);
      setModalContent({
        title,
        description,
        content: getContent ? getContent(onClose) : undefined,
    
      });
    },
    [onClose]
  );

  const modal = useMemo(() => {
    if (!isOpen || !modalContent) {
      return null;
    }


    const { title, description, content } = modalContent;

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full max-w-md overflow-x-hidden max-h-[600px] overflow-y-auto  bg-sidebar">
          {(title || description) && (
            <DialogHeader>
              {title && (
                <DialogTitle className="text-zinc-900 dark:text-white">
                  {title}
                </DialogTitle>
              )}
              {description && (
                <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>
          )}
          <div className="mt-2">{content}</div>
          <DialogClose />
        </DialogContent>
      </Dialog>
    );
  }, [isOpen, modalContent]);

  return [modal, showModal, isOpen]; 
}
