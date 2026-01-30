import { CONFIG } from "../config/app-constant.ts";



type AtomicImageSource = {
    name: string;
    atomic: boolean;
    safety: boolean;
    spectrum: boolean;
};

export const getAtomicImages = (atomImages: object | null | undefined) => {
    if (!atomImages || Object.keys(atomImages).length === 0) {
        return {
            name: "",
            atomic: false,
            safety: false,
            spectrum: false,
        };
    }
    const img = atomImages as AtomicImageSource;

    return {
        name: `${CONFIG.CLOUD_URL}/table-periodic/images/{dirKey}/${img.name}`,
        atomic: img.atomic,
        safety: img.safety,
        spectrum: img.spectrum,
    };
}