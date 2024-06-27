export type TUser = {
    id: string;
    fullName: string;
    password: string;
    email: string;
    phoneNumber: string;
    imageUrl: string;
}

export type TCourse = {
    id: string;
    title: string;
    description: string;
    price: number;
    rating: number;
    category: string;
    duration: number;
    thumbnail: string;
    videosCount: number;
    videos: any[];
    createdAt: Date;
    updatedAt: Date;
}

