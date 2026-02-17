export type TierPricing = {
    slug: string;
    name: string;
    price: string;
    currency: string;
    billingCycle: string;
    features: string[];
    limits: {
        chatAi: {
            daily_messages?: number;
            max_tokens?: number;
            [key: string]: unknown;
        };
    };
    isActive: boolean;
    sortOrder: number;
    isPopular: boolean;
    createdAt: string;
    updatedAt: string;
};
