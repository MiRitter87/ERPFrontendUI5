sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.employee.EmployeeCreate", {
		onInit : function () {
			alert("Init aufgerufen: EmployeeCreate.");
		}
	});

});