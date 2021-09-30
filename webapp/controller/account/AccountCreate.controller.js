sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./AccountController",
	"sap/ui/model/json/JSONModel"
], function (Controller, AccountController, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.account.AccountCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter;
			
			//Register an event handler that gets called every time the router navigates to this view.
			oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("accountCreateRoute").attachMatched(this._onRouteMatched, this);
			
			AccountController.initializeCurrencyComboBox(this.getView().byId("currencyComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			this.resetFormFields();
			this.initializeAccountModel();
    	},


		/**
		 * Initializes the account model to which the UI controls are bound.
		 */
		initializeAccountModel : function () {
			var oAccountModel = new JSONModel();
			
			oAccountModel.loadData("model/account/accountCreate.json");
			this.getView().setModel(oAccountModel, "newAccount");
		},


		/**
		 * Resets the form fields to the initial state.
		 */
		resetFormFields : function () {
			this.getView().byId("balanceInput").setValue(0);
			this.getView().byId("balanceInput").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("currencyComboBox").setSelectedItem(null);
		}
	});
});