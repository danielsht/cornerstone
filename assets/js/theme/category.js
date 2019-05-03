import /* utils, */ { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';

export default class Category extends CatalogPage {
    onReady() {
        compareProducts(this.context.urls);

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }
        // grab button by id and on click send post to cart api to add these 3 products to the cart
        this.button = $('#button-to-cart');
        this.button.click(() => {
            this.postData('/api/storefront/cart', {
                lineItems: [
                    {
                        quantity: 1,
                        productId: 98,
                    },
                    {
                        quantity: 1,
                        productId: 107,
                    },
                    {
                        quantity: 1,
                        productId: 77,
                        optionSelections: [
                            {
                                optionId: 108,
                                optionValue: 70,
                            },
                            {
                                optionId: 109,
                                optionValue: 9,
                            },
                        ],
                    },
                ],
            })
                .then(data => JSON.stringify(data))
                .then(window.location.reload())
                .catch(error => console.error(error));

            /* Different implementation I was playing with using built-in utility files instead of coding my own API access point
            --------------------------------------------------------
            | const formData = new FormData();                     |
            | formData.append('action', 'add');                    |
            | formData.append('product_id', '98');                 |
            | formData.append('qty[]', '1');                       |
            | utils.api.cart.itemAdd(formData, this.readResponse); |
            --------------------------------------------------------
            */
        });
    }
    // Post request to storefront API
    postData(url = '', cartItems = {}) {
        return fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers:
            {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartItems),
        })
            .then(response => response.json());
    }

    readResponse(err) {
        if (err) {
            alert(err);
        }
    }

    initFacetedSearch() {
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.categoryProductsPerPage;
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                productListing: 'category/product-listing',
                sidebar: 'category/sidebar',
            },
            showMore: 'category/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);

            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        });
    }
}
