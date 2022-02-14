export default {

    uploadFixture(name: string): void {
        let blob: Blob;

        cy.fixture(name)
            .then(content => {
                return Cypress.Blob.base64StringToBlob(
                    btoa(content),
                    'application/json',
                );
            })
            .then(b => blob = b);

        cy.get<HTMLInputElement>('input[type="file"]').then(input => {
            const file = new File([blob], name);
            const dataTransfer = new DataTransfer();

            dataTransfer.items.add(file);

            input[0].files = dataTransfer.files;

            input.trigger('change', { force: true });
        });
    },

};
