import { isArray, isString } from 'lodash';
import { HttpClient } from 'typed-rest-client/HttpClient';

type CatalogDataFeed = {
    schema: {
        field_code: string,
        field_description: string,
    }[],
    data: any[][]
}

type CatalogData = CatalogDataItem[];

type CatalogDataItem = {
    [key: string]: any;
};

type Products = CatalogData;

export default class AWDropship {
    private catalogDataFeedUrl = new URL('https://aw-dropship.com/ar_web_catalog_data_feed.php?output=Json&scope=website&scope_key=18');

    private client = new HttpClient('node-aw');

    private catalogData: CatalogData | undefined;
    
    private async getCatalogDataFeed(): Promise<CatalogData> {
        if (this.catalogData) return this.catalogData;

        const response = await this.client.get(this.catalogDataFeedUrl.href);
        const body = await response.readBody();

        const catalogDataFeed: CatalogDataFeed = JSON.parse(body);

        this.catalogData = catalogDataFeed.data.map(value => {
            return Object.fromEntries(catalogDataFeed.schema.map((field, index) => {
                const fieldCode = field.field_code;
                let fieldValue: any = value[index];
                
                if (isString(fieldValue)) {
                    if (fieldCode.endsWith('_datetime')) fieldValue = new Date(fieldValue);
                    if (fieldCode.endsWith('_outer')) fieldValue = parseFloat(fieldValue);
                    if (fieldCode.endsWith('_price')) fieldValue = parseFloat(fieldValue);
                    if (fieldCode.endsWith('_rate')) fieldValue = parseFloat(fieldValue);
                    if (fieldCode.endsWith('_rrp')) fieldValue = parseFloat(fieldValue);
                    if (fieldCode.endsWith('_weight')) fieldValue = parseFloat(fieldValue);
                }

                if (isArray) {
                    if (fieldCode === 'images') {
                        fieldValue = fieldValue.map(value => {
                            if (isString(value)) {
                                if (value.length > 0) value = new URL(value);
                            }

                            return value;
                        });
                    }
                }

                return [fieldCode, fieldValue];
            }));
        });

        return this.catalogData;
    }

    public async getProducts(): Promise<Products> {
        await this.getCatalogDataFeed();

        return this.catalogData;
    }
}