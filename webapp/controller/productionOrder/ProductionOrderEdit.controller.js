sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./ProductionOrderController"
], function (Controller, ProductionOrderController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.productionOrder.ProductionOrderEdit", {		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("salesOrderEditRoute").attachMatched(this._onRouteMatched, this);
			
			ProductionOrderController.initializeStatusComboBox(this.getView().byId("statusComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query Production order and material data every time a user navigates to this view. 
			//This assures that changes are being displayed in the ComboBox.
			/*BusinessPartnerController.queryBusinessPartnersByWebService(this.queryBusinessPartnersCallback, this, false, "CUSTOMER");
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			AccountController.queryAccountsByWebService(this.queryAccountsCallback, this, false);
			SalesOrderController.querySalesOrdersByWebService(this.querySalesOrdersCallback, this, true);
			
			this.getView().setModel(null, "selectedSalesOrder");
			this.resetUIElements();*/
    	},
	});
});