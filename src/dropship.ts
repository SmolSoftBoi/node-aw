import { HttpClient } from 'typed-rest-client/HttpClient';

type CatalogDataFeed = {
    schema: {
        field_code: string,
        field_description: string,
    }[],
    data: unknown[][]
}

type CatalogData = CatalogDataItem[];

type CatalogDataItem = {
    [key: string]: unknown;
};

export type Products = CatalogData;

export type Product = CatalogDataItem;

export default class AWDropship {
    private catalogDataFeedUrl = new URL('https://aw-dropship.com/ar_web_catalog_data_feed.php?output=Json&scope=website&scope_key=18');

    private client = new HttpClient('node-aw');

    private catalogData: CatalogData | undefined;
    
    private async getCatalogDataFeed(): Promise<CatalogData> {
        if (this.catalogData) {
          return this.catalogData;
        }

        const response = await this.client.get(this.catalogDataFeedUrl.href);
        const body = await response.readBody();

        const catalogDataFeed: CatalogDataFeed = JSON.parse(body);

        this.catalogData = catalogDataFeed.data.map(value => {
            return Object.fromEntries(catalogDataFeed.schema.map((field, index) => {
                const fieldCode = field.field_code;
                let fieldValue: unknown = value[index];
                
                if (typeof fieldValue === 'string') {
                    switch (fieldValue.split('_').pop()) {
                        case 'datetime':
                            fieldValue = new Date(fieldValue);
                            break;
                        case 'outer':
                        case 'price':
                        case 'rate':
                        case 'rrp':
                        case 'weight':
                            fieldValue = parseFloat(fieldValue);
                            break;
                    }
                }

                if (fieldValue instanceof Array && fieldCode === 'images') {
                      fieldValue = fieldValue.map(value => {
                          if (typeof fieldValue === 'string' && value.length > 0) {
                                value = new URL(value);
                          }
                
                          return value;
                      });
                }

                return [fieldCode, fieldValue];
            }));
        });

        return this.catalogData;
    }

    public async getProducts(): Promise<Products> {
        return await this.getCatalogDataFeed();
    }
}