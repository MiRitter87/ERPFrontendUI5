sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";
		
	new ComponentContainer({
		name: "ERPFrontendUI5",
		settings : {
			id : "ERPFrontendUI5"
		},
		async: true
	}).placeAt("content");	
});