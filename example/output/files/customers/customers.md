`data classification: `

# file:customers

- [General](#general)
- [Schema](#schema)
- [Dependencies](#dependencies)
- [Dependants](#dependants)

# General <a name="general"></a>


Filename: customer_full.json
Format: json

# Schema <a name="schema"></a>
| Column    | Type        | Comments |
| --------- | ----------- | -------- |
| customer_id | int  | customer identifier |
| address | record  |  |

# Dependencies Lineage <a name="dependencies"></a>

No dependencies found

# Dependants Lineage <a name="dependants"></a>

![image](./dependants.png)
- [pipeline - order_mgmt.load_orders](https://github.com/datayoga-io/lineage/blob/main/example/output//pipelines/order_mgmt/load_orders/load_orders.md)
- [datastore - orders](https://github.com/datayoga-io/lineage/blob/main/example/output//datastores/orders/orders.md)



