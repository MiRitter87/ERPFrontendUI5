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
		
		
		/**
		 * Handles click at the department create tile.
		 */
		onDepartmentCreatePressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("departmentCreateRoute");	
		},
		
		
		/**
		 * Handles click at the department edit tile.
		 */
		onDepartmentEditPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("departmentEditRoute");	
		},
		
		
		/**
		 * Handles click at the department display tile.
		 */
		onDepartmentDisplayPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("departmentDisplayRoute");	
		},
		
		
		/**
		 * Handles click at the department overview tile.
		 */
		onDepartmentOverviewPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("departmentOverviewRoute");	
		},
	});

});