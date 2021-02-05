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
			else if(item.getKey() == "employeeDisplay") {
				oRouter.navTo("employeeDisplayRoute");			
			}
			else if(item.getKey() == "employeeOverview") {
				oRouter.navTo("employeeOverviewRoute");	
			}
			else if(item.getKey() == "employeeChange") {
				oRouter.navTo("employeeEditRoute");	
			}
			else if(item.getKey() == "departmentCreate") {
				oRouter.navTo("departmentCreateRoute");
			}
			else if(item.getKey() == "departmentChange") {
				oRouter.navTo("departmentEditRoute");
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