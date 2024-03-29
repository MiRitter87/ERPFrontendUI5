sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./AccountController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, AccountController, formatter, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.account.AccountDisplay", {
		formatter: formatter,
		
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("accountDisplayRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			AccountController.queryAccountsByWebService(this.queryAccountsCallback, this, true);
			
			this.getView().setModel(null, "selectedAccount");
			this.resetUIElements();
    	},


		/**
		 * Handles the selection of an item in the account ComboBox.
		 */
		onAccountSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oAccountsModel = this.getView().getModel("accounts");
			var oAccount;
			var oAccountModel = new JSONModel();
			
			if(oSelectedItem == null) {
				this.getView().setModel(oAccountModel, "selectedAccount");
				this.resetUIElements();
				return;
			}
			
			oAccount = AccountController.getAccountById(oSelectedItem.getKey(), oAccountsModel.oData.account);
			oAccountModel.setData(oAccount);
			
			//Set the model of the view according to the selected account to allow binding of the UI elements.
			this.getView().setModel(oAccountModel, "selectedAccount");
		},


		/**
		 * Callback function of the queryAccounts RESTful WebService call in the AccountController.
		 */
		queryAccountsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("accountDisplay.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "accounts");
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("accountComboBox").setSelectedItem(null);
			
			this.getView().byId("idText").setText("");
			this.getView().byId("descriptionText").setText("");
			
			this.getView().byId("balanceText").setText("");
			this.getView().byId("currencyText").setText("");
			
			this.getView().byId("postingTable").destroyItems();
		},
		
		
		/**
		 * Formatter of the posting type text.
		 */
		typeTextFormatter: function(sType) {
			return AccountController.typeTextFormatter(sType, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		}
	});
});