import request from '../utils/request';

export interface RagQueryParams {
    question: string;
    imageUrl?: string;
}

export interface RagQueryResult {
    answer: string;
    sources: string[];
}

export const ragQuery = (params: RagQueryParams) => {
    return request<RagQueryResult>({
        url: '/api/rag/query',
        method: 'POST',
        data: params,
    });
};

export const uploadFile = (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    return request<string>({
        url: '/api/file/upload',
        method: 'POST',
        data: formData,
    });
};
