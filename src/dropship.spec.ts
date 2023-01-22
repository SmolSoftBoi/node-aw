import AWDropship from "./dropship";

describe('AW Dropship', () => {
    const dropship = new AWDropship();

    describe('AWDropship.getProducts', () => {
        const products = dropship.getProducts();

        it('Should return products.', async () => {
            await products;
            expect(products).toBeDefined();
        }, 60000);
    });
});