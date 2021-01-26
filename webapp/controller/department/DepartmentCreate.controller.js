sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.department.DepartmentCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");	
		},
	});
});