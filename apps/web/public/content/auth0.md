# Send Auth0 Logs Streams to Tinybird

[Auth0](https://auth0.com) is a developer-focused user management platform to handle user authentication with many prebuilt UI components. By integrating Auth0 with Tinybird, you can analyze your user authentication data in real time and enrich it with other data sources.

Some common use cases for sending Auth0 logs to Tinybird include:

1. Tracking net user and organization growth.
2. Monitoring user churn.
3. Identifying common auth errors.
4. Creating custom dashboards for auth analysis.
5. User authentication audit logs.

Read on to learn how to send data from Auth0 Logs Streams to Tinybird.

## Before you start

Before you connect Auth0 Logs Streams to Tinybird, ensure:

* You have an Auth0 account.
* You have a Tinybird Workspace.

## Connect Auth0 to Tinybird

1. From the Auth0 dashboard, select **Monitoring** > **Streams**.
   
2. Select **Create Stream**.

3. In Tinybird, create a Data Source, called `auth0` in this example, with the following schema:

```tb {% title = 'Data Source schema for Auth0 logs streams %}
SCHEMA >
    `log_id` String `json:$.log_id`,
    `type` String `json:$.data.type` DEFAULT 'unknown',
    `date` DateTime64(3) `json:$.data.date` DEFAULT now(),
    `client_name` LowCardinality(String) `json:$.data.client_name` DEFAULT 'unknown',
    `user_id` String `json:$.data.user_id` DEFAULT 'unknown',
    `connection_id` Nullable(String) `json:$.data.connection_id`,
    `ip` Nullable(String) `json:$.data.ip`,
    `data_log_id` Nullable(String) `json:$.data.log_id`,
    `user_name` Nullable(String) `json:$.data.user_name`,
    `client_id` Nullable(String) `json:$.data.client_id`,
    `client_ip` Nullable(String) `json:$.data.client_ip`,
    `tenant_name` Nullable(String) `json:$.data.tenant_name`,
    `description` Nullable(String) `json:$.data.description`,
    `connection` Nullable(String) `json:$.data.connection`,
    `audience` Nullable(String) `json:$.data.audience`,
    `scope` Array(Nullable(String)) `json:$.data.scope[:]`,
    `user_agent` Nullable(String) `json:$.data.user_agent`,
    `hostname` Nullable(String) `json:$.data.hostname`,
    `strategy` Nullable(String) `json:$.data.strategy`,
    `strategy_type` Nullable(String) `json:$.data.strategy_type`,
    `tracking_id` Nullable(String) `json:$.data.tracking_id`,
    `event_schema_version` Nullable(String) `json:$.data.['$event_schema'].version`,
    `auth0_client` JSON `json:$.data.auth0_client` DEFAULT '{}',
    `details` JSON `json:$.data.details` DEFAULT '{}'

ENGINE "MergeTree"
ENGINE_PARTITION_KEY "toYYYYMM(date)"
ENGINE_SORTING_KEY "type, user_id, date"
```

Using the [JSON Data Type](/sql-reference/data-types/json) you can store the semi-structured data you receive from Auth0 Logs Streams in a single column. You can later retrieve various events and their metadata as needed in your Pipes.

4. In Tinybird, copy a token with privileges to append to the Data Source you created. You can use the admin token or create one with the required scope.

5. Back in Auth0, paste the Events API URL in your Webhook Endpoint URL. Use the query parameter `name` to match the name of the Data Source you created in Tinybird. For example: 

```
https://api.tinybird.co/v0/events?name=auth0&token=TOKEN
```

Content Type is `application/json` and Content Format is `JSON Lines`.

1. Select the any event category to filter, like `All`, and a date in case you want to perform some backfilling. Then select **Save**.

2. You're done. Any of the Auth0 Log Streams events you selected is automatically sent to Tinybird through the [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api).

You can check the status of the integration from the **Health** tab in the created webhook or from the **Log** tab in the Tinybird `auth0` Data Source. 
    
## See also

* [Events API](https://tinybird.co/docs/get-data-in/ingest-apis/events-api)
* [Auth0 Logs Streams](https://auth0.com/docs/customize/log-streams/custom-log-streams)
