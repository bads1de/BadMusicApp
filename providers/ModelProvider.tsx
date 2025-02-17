"use client";

import AuthModal from "@/components/Modals/AuthModal";
import PlaylistModal from "@/components/Modals/PlaylistModal";
import SubscribeModal from "@/components/Modals/SubscribeModal";
import SunoModal from "@/components/Modals/SunoModal";
import SpotlightModal from "@/components/Modals/SpotlightModal";
import UploadModal from "@/components/Modals/UploadModal";
import { ProductWithPrice } from "@/types";
import { useEffect, useState } from "react";
import SpotlightUploadModal from "@/components/Modals/SpotlightUploadModal";

interface ModalProviderProps {
  products: ProductWithPrice[];
}

const ModalProvider: React.FC<ModalProviderProps> = ({ products }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <AuthModal />
      <UploadModal />
      <PlaylistModal />
      <SunoModal />
      <SpotlightModal />
      <SpotlightUploadModal />
      <SubscribeModal products={products} />
    </>
  );
};

export default ModalProvider;
