export default {

    uploadFixture(label: string, filename: string): void {
        cy.fixtureBlob(filename).then(({ blob }) => {
            cy.contains('label', label).get<[HTMLInputElement]>('input[type="file"]').then(input => {
                const file = new File([blob], filename);
                const dataTransfer = new DataTransfer();

                dataTransfer.items.add(file);

                input[0].files = dataTransfer.files;

                input[0].dispatchEvent(new Event('change'));
            });
        });
    },

};
