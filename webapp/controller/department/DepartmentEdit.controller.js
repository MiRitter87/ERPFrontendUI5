sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.department.DepartmentEdit", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			this.getView().setModel(new JSONModel());
			this.queryDepartmentWebService();
			this.queryEmployeeWebService();
		},
		
		
		/**
		 * Queries the employee WebService. If the call is successful, the model is updated with the employee data.
		 */
		queryDepartmentWebService : function() {
			var webServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/department");
			var queryUrl = webServiceBaseUrl + "/";
			var oModel = this.getView().getModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : queryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({departments : data}, true); // not aData
					
					if(data.data != null) {
						MessageToast.show(oResourceBundle.getText("departmentEdit.dataLoaded"));
					}
					else {
						if(data.message != null)
							MessageToast.show(data.message[0].text);
					}
				},
				context : this
			});                                                                 
			
			this.getView().setModel(oModel);
		},
		
		
		/**
		 * Queries the employee WebService. If the call is successful, the model is updated with the employee data.
		 */
		queryEmployeeWebService : function() {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var oModel = this.getView().getModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : sQueryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({employees : data}, true); // not aData
					
					if(data.data == null && data.message != null)  {
						MessageToast.show(data.message[0].text);
					}
				},
				context : this
			});                                                                 
			
			this.getView().setModel(oModel);
		},
	});
});