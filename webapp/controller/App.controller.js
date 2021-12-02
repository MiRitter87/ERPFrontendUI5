sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.App", {
		
		/**
		 * Handles the selection of an item in the navigation menu.
		 */
		onItemSelect : function(oEvent) {
			var item = oEvent.getParameter('item');
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			if(item.getKey() == "employeeCreate") {
				oRouter.navTo("employeeCreateRoute");			
			}
			else if(item.getKey() == "employeeEdit") {
				oRouter.navTo("employeeEditRoute");	
			}
			else if(item.getKey() == "employeeDisplay") {
				oRouter.navTo("employeeDisplayRoute");			
			}
			else if(item.getKey() == "employeeOverview") {
				oRouter.navTo("employeeOverviewRoute");	
			}
			else if(item.getKey() == "departmentCreate") {
				oRouter.navTo("departmentCreateRoute");
			}
			else if(item.getKey() == "departmentEdit") {
				oRouter.navTo("departmentEditRoute");
			}
			else if(item.getKey() == "departmentDisplay") {
				oRouter.navTo("departmentDisplayRoute");
			}
			else if(item.getKey() == "departmentOverview") {
				oRouter.navTo("departmentOverviewRoute");
			}
			else if(item.getKey() == "materialCreate") {
				oRouter.navTo("materialCreateRoute");
			}
			else if(item.getKey() == "materialEdit") {
				oRouter.navTo("materialEditRoute");
			}
			else if(item.getKey() == "materialDisplay") {
				oRouter.navTo("materialDisplayRoute");
			}
			else if(item.getKey() == "materialOverview") {
				oRouter.navTo("materialOverviewRoute");
			}
			else if(item.getKey() == "businessPartnerCreate") {
				oRouter.navTo("businessPartnerCreateRoute");
			}
			else if(item.getKey() == "businessPartnerEdit") {
				oRouter.navTo("businessPartnerEditRoute");
			}
			else if(item.getKey() == "businessPartnerDisplay") {
				oRouter.navTo("businessPartnerDisplayRoute");
			}
			else if(item.getKey() == "businessPartnerOverview") {
				oRouter.navTo("businessPartnerOverviewRoute");
			}
			else if(item.getKey() == "salesOrderCreate") {
				oRouter.navTo("salesOrderCreateRoute");
			}
			else if(item.getKey() == "salesOrderEdit") {
				oRouter.navTo("salesOrderEditRoute");
			}
			else if(item.getKey() == "salesOrderDisplay") {
				oRouter.navTo("salesOrderDisplayRoute");
			}
			else if(item.getKey() == "salesOrderOverview") {
				oRouter.navTo("salesOrderOverviewRoute");
			}
			else if(item.getKey() == "purchaseOrderCreate") {
				oRouter.navTo("purchaseOrderCreateRoute");
			}
			else if(item.getKey() == "purchaseOrderEdit") {
				oRouter.navTo("purchaseOrderEditRoute");
			}
			else if(item.getKey() == "purchaseOrderDisplay") {
				oRouter.navTo("purchaseOrderDisplayRoute");
			}
			else if(item.getKey() == "purchaseOrderOverview") {
				oRouter.navTo("purchaseOrderOverviewRoute");
			}
			else if(item.getKey() == "accountCreate") {
				oRouter.navTo("accountCreateRoute");
			}
			else if(item.getKey() == "accountEdit") {
				oRouter.navTo("accountEditRoute");
			}
			else if(item.getKey() == "accountDisplay") {
				oRouter.navTo("accountDisplayRoute");
			}
			else if(item.getKey() == "accountOverview") {
				oRouter.navTo("accountOverviewRoute");
			}
			else if(item.getKey() == "billOfMaterialCreate") {
				oRouter.navTo("billOfMaterialCreateRoute");
			}
			else if(item.getKey() == "billOfMaterialEdit") {
				oRouter.navTo("billOfMaterialEditRoute");
			}
			else if(item.getKey() == "billOfMaterialDisplay") {
				oRouter.navTo("billOfMaterialDisplayRoute");
			}
		},
		
		
		/**
		 * Handles the press-event of the home icon.
		 */
		onHomeIconPressed: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("startPageRoute");	
		}
	});

});