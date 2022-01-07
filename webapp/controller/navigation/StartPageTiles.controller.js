sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.navigation.StartPageTiles", {
		onInit : function () {

		},
		
		
		/**
		 * Handles click at the employee create tile.
		 */
		onEmployeeCreatePressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("employeeCreateRoute");	
		},
		
		
		/**
		 * Handles click at the employee edit tile.
		 */
		onEmployeeEditPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("employeeEditRoute");	
		},
		
		
		/**
		 * Handles click at the employee display tile.
		 */
		onEmployeeDisplayPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("employeeDisplayRoute");	
		},
		
		
		/**
		 * Handles click at the employee overview tile.
		 */
		onEmployeeOverviewPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("employeeOverviewRoute");	
		},
	});

});