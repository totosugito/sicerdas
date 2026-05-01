import env from "../config/env.config.ts";

type AtomicImageSource = {
  atomic: string;
  safety: string;
  spectrum: string;
};

export const getAtomicImages = (atomImages: object | null | undefined) => {
  if (!atomImages || Object.keys(atomImages).length === 0) {
    return {
      atomic: "",
      safety: "",
      spectrum: "",
    };
  }
  const img = atomImages as AtomicImageSource;

  return {
    atomic: img.atomic
      ? `${env.server.s3Storage.publicUrl}/table-periodic/images/atomic/${img.atomic}`
      : "",
    safety: img.safety
      ? `${env.server.s3Storage.publicUrl}/table-periodic/images/safety/${img.safety}`
      : "",
    spectrum: img.spectrum
      ? `${env.server.s3Storage.publicUrl}/table-periodic/images/spectrum/${img.spectrum}`
      : "",
  };
};
