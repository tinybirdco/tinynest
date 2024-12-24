# Connect Stripe to Tinybird

1. In Stripe, go to [Webhooks](https://dashboard.stripe.com/webhooks).
   
2. Select **Add endpoint**.

3. In Tinybird, go to Tokens, and copy the `append` token.

4. Back in Stripe, paste the Events API URL in your Webhook URL. Use the query parameter `name=stripe`, `token=<your token>` and `format=json`. For example:

```
https://api.tinybird.co/v0/events?name=stripe&token=TOKEN&format=json
```

5. Select **Select events** and choose the events you want to send to Tinybird.

6.  You're done. Stripe events are automatically sent to Tinybird via the [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).
   
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).
