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
		
		
		/**
		 * Handles click at the material create tile.
		 */
		onMaterialCreatePressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("materialCreateRoute");	
		},
		
		
		/**
		 * Handles click at the material edit tile.
		 */
		onMaterialEditPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("materialEditRoute");	
		},
		
		
		/**
		 * Handles click at the material display tile.
		 */
		onMaterialDisplayPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("materialDisplayRoute");	
		},
		
		
		/**
		 * Handles click at the material overview tile.
		 */
		onMaterialOverviewPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("materialOverviewRoute");	
		},
		
		
		/**
		 * Handles click at the bill of material create tile.
		 */
		onBillOfMaterialCreatePressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("billOfMaterialCreateRoute");	
		},
		
		
		/**
		 * Handles click at the bill of material edit tile.
		 */
		onBillOfMaterialEditPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("billOfMaterialEditRoute");	
		},
		
		
		/**
		 * Handles click at the bill of material display tile.
		 */
		onBillOfMaterialDisplayPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("billOfMaterialDisplayRoute");	
		},
		
		
		/**
		 * Handles click at the bill of material overview tile.
		 */
		onBillOfMaterialOverviewPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("billOfMaterialOverviewRoute");	
		},
		
		
		/**
		 * Handles click at the sales order create tile.
		 */
		onSalesOrderCreatePressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("salesOrderCreateRoute");	
		},
		
		
		/**
		 * Handles click at the sales order edit tile.
		 */
		onSalesOrderEditPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("salesOrderEditRoute");	
		},
		
		
		/**
		 * Handles click at the sales order display tile.
		 */
		onSalesOrderDisplayPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("salesOrderDisplayRoute");	
		},
		
		
		/**
		 * Handles click at the sales order overview tile.
		 */
		onSalesOrderOverviewPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("salesOrderOverviewRoute");	
		},
		
		
		/**
		 * Handles click at the purchase order create tile.
		 */
		onPurchaseOrderCreatePressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("purchaseOrderCreateRoute");	
		},
		
		
		/**
		 * Handles click at the purchase order edit tile.
		 */
		onPurchaseOrderEditPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("purchaseOrderEditRoute");	
		},
		
		
		/**
		 * Handles click at the purchase order display tile.
		 */
		onPurchaseOrderDisplayPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("purchaseOrderDisplayRoute");	
		},
		
		
		/**
		 * Handles click at the purchase order overview tile.
		 */
		onPurchaseOrderOverviewPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("purchaseOrderOverviewRoute");	
		},
		
		
		/**
		 * Handles click at the business partner create tile.
		 */
		onBusinessPartnerCreatePressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("businessPartnerCreateRoute");	
		},
		
		
		/**
		 * Handles click at the business partner edit tile.
		 */
		onBusinessPartnerEditPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("businessPartnerEditRoute");	
		},
		
		
		/**
		 * Handles click at the business partner display tile.
		 */
		onBusinessPartnerDisplayPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("businessPartnerDisplayRoute");	
		},
		
		
		/**
		 * Handles click at the business partner overview tile.
		 */
		onBusinessPartnerOverviewPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("businessPartnerOverviewRoute");	
		}
	});

});