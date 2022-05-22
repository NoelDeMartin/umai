declare module 'image-blob-reduce' {
    class ImageBlobReduce {

        public toBlob(in_blob: Blob, options?: { max?: number }): Promise<Blob>;
    
    }

    export default ImageBlobReduce;
}
