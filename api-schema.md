# API Specifications

### `GET /orders`

Returns a list of all orders in the system.

#### Response Schema

```ts
{
    orders: Array<{
        id: string,
        status: 'RECEIVED' | 'QUOTED' | 'BOOKED' | 'CANCELLED',
        customer: string,
        items: Array<{
            sku: string,
            quantity: number,
            gramsPerItem: number,
            price: number
        }>
        carrierPricePaid?: number;
        carrierBooked?: 'UPS' | 'FEDEX' | 'USPS';
        quotes: Array<{
            carrier: 'UPS' | 'FEDEX' | 'USPS',
            priceCents: number
        }>
    }>
}
```

#### Filters

* `status`: filter by status, e.g. `/orders?status=RECEIVED`

### `POST /orders`

Creates a new order

#### Request Schema

```ts
{
    id: string;
    customer: string;
    items: Array<{
        sku: string,
        quantity: number,
        gramsPerItem: number,
        price: number
    }>
}
```

#### Successful Response Schema

```ts
{
  outcome: 'SUCCESS';
  order: {
    id: string;
    status: 'RECEIVED';
    customer: string;
    items: Array<{
      sku: string,
      quantity: number,
      gramsPerItem: number,
      price: number
    }>;
    quotes: [];
  }
}
```

### `POST /orders/:id/quotes`

Generate quotes for an order for the given carriers and returns the quotes. Updates the order status to `QUOTED`.

#### Request Schema

```ts
{
    carriers: Array<'UPS' | 'FEDEX' | 'USPS'>
}
```

#### Successful Response Schema

```ts
{
  outcome: 'SUCCESS';
  order: {
    id: string;
    status: 'RECEIVED';
    customer: string;
    items: Array<{
      sku: string,
      quantity: number,
      gramsPerItem: number,
      price: number
    }>;
    quotes: Array<{
      carrier: 'UPS' | 'FEDEX' | 'USPS',
      priceCents: number
    }>;
  }
}
```

### `POST /orders/:id/bookings`

* Creates a booking for the given carrier and updates the order status to `BOOKED`.
* Returns the booking details.
* If a quote for the requested carrier booking is not available, returns a 400 error.

#### Request Schema

```ts
{
    carrier: 'UPS' | 'FEDEX' | 'USPS'
}
```

#### Successful Response Schema

```ts
{
  outcome: 'SUCCESS';
  order: {
    id: string;
    status: 'RECEIVED';
    customer: string;
    items: Array<{
      sku: string,
      quantity: number,
      gramsPerItem: number,
      price: number
    }>;
    quotes: Array<{
      carrier: 'UPS' | 'FEDEX' | 'USPS',
      priceCents: number
    }>;
    carrierBooked: 'UPS' | 'FEDEX' | 'USPS';
    carrierPricePaid: number;
  }
}
```