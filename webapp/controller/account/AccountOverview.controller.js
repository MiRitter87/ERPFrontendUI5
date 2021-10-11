sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./AccountController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, AccountController, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.account.AccountOverview", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("accountOverviewRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			AccountController.queryAccountsByWebService(this.queryAccountsCallback, this, true);
    	},


		/**
		 * Handles the press-event of the delete button.
		 */
		onDeletePressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.isAccountSelected() == false) {
				MessageBox.error(oResourceBundle.getText("accountOverview.noAccountSelected"));
				return;
			}
			
			AccountController.deleteAccountByWebService(this.getSelectedAccount(), this.deleteAccountCallback, this);
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
					MessageToast.show(oResourceBundle.getText("accountOverview.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "accounts");
		},
		
		
		/**
		 * Callback function of the deleteAccount RESTful WebService call in the AccountController.
		 */
		deleteAccountCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					AccountController.queryAccountsByWebService(oCallingController.queryAccountsCallback, oCallingController, false);
				}
				
				if(oReturnData.message[0].type == 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			}
		},
		
		
		/**
		 * Checks if an account has been selected.
		 */
		isAccountSelected : function () {
			if(this.getView().byId("accountTable").getSelectedItem() == null)
				return false;
			else
				return true;
		},
		
		
		/**
		 * Gets the the selected account.
		 */
		getSelectedAccount : function () {
			var oListItem = this.getView().byId("accountTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("accounts");
			var oSelectedAccount = oContext.getProperty(null, oContext);
			
			return oSelectedAccount;
		}
	});
});