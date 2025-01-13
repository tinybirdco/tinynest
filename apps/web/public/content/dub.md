# Connect Dub to Tinybird

1. Open the Dub UI and go to the Settings > Webhooks page.
   
2. Select "Create Webhook".

3. In Tinybird, go to Tokens, and copy the `append` token.

4. Back in Dub, paste the Events API URL as your webhook URL. Use the query parameter `name=dub` and `token=<your token>`. For example:

```
https://api.tinybird.co/v0/events?name=dub&token=TOKEN
```

5. Select the checkboxes for the events you want to send to Tinybird, and select "Create webhook".

6. You're done. Dub will now push events to Tinybird via the [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).
   
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).
