# Send Orb events to Tinybird

[Orb](https://withorb.com) is a developer-focused platform to manage your subscription billing and revenue operations. By integrating Orb with Tinybird, you can analyze your subscription billing data in real time and enrich it with other data sources.

Some common use cases for sending Orb events to Tinybird include:

1. Tracking and monitoring subscriptions.
2. Monitoring user churn.
3. Creating custom dashboards for subscription analysis.
4. Subscriptions logs.

Read on to learn how to send events from Orb to Tinybird.

## Before you start

Before you connect Orb to Tinybird, ensure:

* You have an Orb account.
* You have a Tinybird Workspace.

## Connect Orb to Tinybird

1. From the Orb dashboard, select **Developers** > **Webhooks**.
   
2. Select **Add Endpoint**.

3. In Tinybird, create a Data Source, called `orb` in this example, with the following schema:

```tb {% title = 'Data Source schema for Orb events %}
SCHEMA >
    `id` String `json:$.id`,
    `type` LowCardinality(String) `json:$.type` DEFAULT 'unknown',
    `date` DateTime64(3) `json:$.created_at` DEFAULT now(),
    `resource_name` LowCardinality(String) `json:$.resource_name` DEFAULT 'unknown',
    `details` JSON `json:$.properties` DEFAULT '{}'

ENGINE "MergeTree"
ENGINE_PARTITION_KEY "toYYYYMM(date)"
ENGINE_SORTING_KEY "type, resource_name, date"
```

Using the [JSON Data Type](/sql-reference/data-types/json) you can store the semi-structured data you receive from Orb in a single column. You can later retrieve various events and their metadata as needed in your Pipes.

4. In Tinybird, copy a token with privileges to append to the Data Source you created. You can use the admin token or create one with the required scope.

5. Back in Orb, paste the Events API URL in your Webhook Endpoint URL. Use the query parameter `name` to match the name of the Data Source you created in Tinybird. For example: 

```
https://api.tinybird.co/v0/events?name=orb&token={% user("userToken") %}
```

1. Select **Send test request** to test the connection and check the data gets to the `orb` Data Source in Tinybird.

2. You're done. Any of the Orb events is automatically sent to Tinybird through the [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).

You can check the status of the integration by clicking on the Webhook endpoint in Orb or from the **Log** tab in the Tinybird `orb` Data Source. 
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api)
* [Orb webhooks](https://docs.withorb.com/guides/integrations-and-exports/webhooks)
