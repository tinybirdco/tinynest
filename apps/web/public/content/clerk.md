# Connect Clerk to Tinybird

1. From the Clerk UI, select **Configure** > **Webhooks**.
   
2. Select **Add Endpoint**.

3. In Tinybird, go to Tokens, and copy the `append` token.

4. Back in Clerk, paste the Events API URL in your Webhook Endpoint URL. Use the query parameter `name=clerk` and `token=<your token>`. For example:

```
https://api.tinybird.co/v0/events?name=clerk&token=TOKEN
```

5. Select the checkboxes for the Clerk events you want to send to Tinybird, and select **Create**.

4. You're done. Any of the Clerk events you selected is automatically sent to Tinybird through the [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api). You can test the integration from the **Testing** tab in the Clerk Webhooks UI.
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api)
