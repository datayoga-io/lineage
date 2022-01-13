`data classification: `

# file:exported_orders

- [General](#general)
- [Dependencies](#dependencies)
- [Dependants](#dependants)

# General <a name="general"></a>


Filename: orders_{[0-9]}6.csv
Format: delimited
Delimiter: ,

# Dependencies Lineage <a name="dependencies"></a>

![image](./dependencies.png)


# Dependants Lineage <a name="dependants"></a>

![image](./dependants.png)

- [pipeline - ELT.load_raw_orders](https://github.com/datayoga-io/lineage/blob/master/example/output//pipelines/ELT/load_raw_orders/load_raw_orders.md)
- [datastore - raw_orders](https://github.com/datayoga-io/lineage/blob/master/example/output//datastores/raw_orders/raw_orders.md)
- [pipeline - order_mgmt.load_orders](https://github.com/datayoga-io/lineage/blob/master/example/output//pipelines/order_mgmt/load_orders/load_orders.md)
- [datastore - orders](https://github.com/datayoga-io/lineage/blob/master/example/output//datastores/orders/orders.md)

# Direct Sources


# Direct Targets



