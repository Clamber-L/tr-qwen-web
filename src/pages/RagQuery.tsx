import { useRef, useState } from 'react';

import type { RagQueryResult } from '../api/rag';

import { ragQuery, uploadFile } from '../api/rag';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const RagQuery = () => {
    const [question, setQuestion] = useState('');
    const [result, setResult] = useState<RagQueryResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('仅支持 jpeg、jpg、png 格式的图片');
            return;
        }
        setError('');
        setImagePreview(URL.createObjectURL(file));
        setUploading(true);
        try {
            const url = await uploadFile(file);
            setImageUrl(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : '上传失败');
            setImagePreview('');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setImageUrl('');
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!question.trim()) return;
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const data = await ragQuery({
                question: question.trim(),
                imageUrl: imageUrl || undefined,
            });
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : '请求失败');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await handleSubmit();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">消防巡查检查</h1>

                <div className="bg-white rounded-xl shadow p-5 mb-5">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                        请输入问题
                    </label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                        rows={3}
                        placeholder="例如：检查场所没有消火栓"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                    />

                    <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            上传图片（可选，支持 jpeg / jpg / png）
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpeg,.jpg,.png"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={loading || uploading}
                        />
                        {imagePreview ? (
                            <div className="flex items-start gap-3">
                                <img
                                    src={imagePreview}
                                    alt="预览"
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                />
                                <div className="flex flex-col gap-1">
                                    {uploading && (
                                        <span className="text-xs text-blue-500">上传中...</span>
                                    )}
                                    {imageUrl && !uploading && (
                                        <span className="text-xs text-green-600">上传成功</span>
                                    )}
                                    <button
                                        type="button"
                                        className="text-xs text-red-500 hover:text-red-700"
                                        onClick={handleRemoveImage}
                                        disabled={uploading}
                                    >
                                        移除图片
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="border border-dashed border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading || uploading}
                            >
                                + 点击上传图片
                            </button>
                        )}
                    </div>

                    <div className="flex justify-end mt-3">
                        <button
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                            onClick={handleSubmit}
                            disabled={loading || uploading || !question.trim()}
                        >
                            {loading ? '查询中...' : '提交'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-4 mb-5">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="space-y-4">
                        {(() => {
                            const parts = result.answer.split(/(?=二、整改措施)/);
                            const issues = parts[0]?.replace(/^一、存在问题\s*/, '').trim();
                            const measures = parts[1]?.replace(/^二、整改措施\s*/, '').trim();
                            return (
                                <>
                                    {issues && (
                                        <div className="bg-white rounded-xl shadow p-5">
                                            <h2 className="text-sm font-semibold text-red-500 mb-3">
                                                一、存在问题
                                            </h2>

                                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                                {issues}
                                            </p>
                                        </div>
                                    )}
                                    {measures && (
                                        <div className="bg-white rounded-xl shadow p-5">
                                            <h2 className="text-sm font-semibold text-green-600 mb-3">
                                                二、整改措施
                                            </h2>
                                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                                {measures}
                                            </p>
                                        </div>
                                    )}
                                    {!issues && !measures && (
                                        <div className="bg-white rounded-xl shadow p-5">
                                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                                回答
                                            </h2>
                                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                                {result.answer}
                                            </p>
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        {result.sources.length > 0 && (
                            <div className="bg-white rounded-xl shadow p-5">
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                    检查项
                                </h2>
                                <ul className="space-y-2">
                                    {result.sources.map((source, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-2 text-sm text-gray-700"
                                        >
                                            <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">
                                                {index + 1}
                                            </span>
                                            {source}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RagQuery;
