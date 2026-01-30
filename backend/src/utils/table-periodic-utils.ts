import { CONFIG } from "../config/app-constant.ts";



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
        atomic: img.atomic ? `${CONFIG.CLOUD_URL}/table-periodic/images/atomic/${img.atomic}` : "",
        safety: img.safety ? `${CONFIG.CLOUD_URL}/table-periodic/images/safety/${img.safety}` : "",
        spectrum: img.spectrum ? `${CONFIG.CLOUD_URL}/table-periodic/images/spectrum/${img.spectrum}` : "",
    };
}