const MIME_TYPE_EXTENSIONS: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.json': 'application/json',
    '.jsonld': 'application/json',
};

function getFileMimeType(filename: string): string {
    const extensionMatch = Object.keys(MIME_TYPE_EXTENSIONS).find(extension =>
        filename.toLowerCase().endsWith(extension));

    return MIME_TYPE_EXTENSIONS[extensionMatch ?? ''] ?? 'text/plain';
}

export default {
    uploadFixture(label: string, filename: string): void {
        cy.fixture(filename).then(content => {
            const mimeType = getFileMimeType(filename);

            if (mimeType === 'application/json') content = btoa(content);

            const blob = Cypress.Blob.base64StringToBlob(content, mimeType);

            cy.contains('label', label)
                .get<[HTMLInputElement]>('input[type="file"]')
                .then(input => {
                    const file = new File([blob], filename);
                    const dataTransfer = new DataTransfer();

                    dataTransfer.items.add(file);

                    input[0].files = dataTransfer.files;

                    input[0].dispatchEvent(new Event('change'));
                });
        });
    },
};
