# Send Clerk webhooks to Tinybird

[Clerk](https://clerk.com/) is a developer-focused user management platform to handle user authentication with many prebuilt UI components. By integrating Clerk with Tinybird, you can analyze your user authentication data in real time and enrich it with other data sources.

Some common use cases for sending Clerk webhooks to Tinybird include:

1. Tracking net user and organization growth.
2. Monitoring user churn.
3. Identifying common auth errors.
4. Creating custom dashboards for auth analysis.
5. Enriching other data sources with real-time auth metrics.

Read on to learn how to send data from Clerk to Tinybird.

## Before you start

Before you connect Clerk to Tinybird, ensure:

* You have a Clerk account.
* You have a Tinybird Workspace.

## Connect Clerk to Tinybird

1. From the Clerk UI, select **Configure** > **Webhooks**.
   
2. Select **Add Endpoint**.

3. In Tinybird, create a Data Source, called `clerk` in this example, with the following schema:

```tb {% title = 'Data Source schema for Clerk events %}
SCHEMA >
  'ingest_timestamp' DateTime `json:$.time` DEFAULT now(),
  'record' JSON `json:$`

ENGINE "MergeTree"
ENGINE_SORTING_KEY "ingest_timestamp"
ENGINE_TTL ""
ENGINE_PARTITION_KEY ""
```

Using the [JSON Data Type](/sql-reference/data-types/json) you can store the semi-structured data you receive from Clerk in a single column. You can later retrieve various events and their metadata as needed in your Pipes.

4. Back in Clerk, paste the Events API URL in your Webhook Endpoint URL. Use the query parameter `name` to match the name of the Data Source you created in Tinybird, for example: 

```
https://api.tinybird.co/v0/events?name=clerk
```

1. Return to Tinybird, and copy a token with privileges to write to the Data Source you created. You can use the admin token or create one with the required scope.

2. Return to the Clerk Webhooks page, and update the URL to add a new search parameter `token` with the token you copied. The final URL looks like the following:

```
https://api.tinybird.co/v0/events?name=clerk&token=p.eyXXXXX
```

3. Select the checkboxes for the Clerk events you want to send to Tinybird, and select **Create**.

4. You're done. Any of the Clerk events you selected is automatically sent to Tinybird through the [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api). You can test the integration from the **Testing** tab in the Clerk Webhooks UI. 
   
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api)
