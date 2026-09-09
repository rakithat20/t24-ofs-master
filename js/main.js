Vue.component("reverse-ofs",{
	template: "#reverseOfsTemplate",
	data: function(){
		return {rawMessage:"", parsed:null, error:""}
	},
	watch: {
		rawMessage: function(){ this.parseMessage() }
	},
	methods:{
		loadExample: function(){
			this.rawMessage = "ACCOUNT,P1/I/PROCESS/2/1,INPUTT/123456/BNK,100724,CUSTOMER=100724,CATEGORY=1001"
		},
		clearMessage: function(){ this.rawMessage = ""; this.parsed = null; this.error = "" },
		decodeId: function(value){
			return value.replace(/\?/g, ",").replace(/\^/g, "/")
		},
		decodeData: function(value){
			return value.replace(/%\?%|%\^%|%\|%|'_'|\|/g, function(token){
				var replacements = {"%?%":"?", "%^%":"^", "%|%":"|", "'_'":"_", "|":"\""}
				return replacements[token]
			})
		},
		parseMessage: function(){
			var value = this.rawMessage.trim()
			this.error = ""
			this.parsed = null
			if (!value){ return }

			var parts = value.split(",")
			if (parts.length < 4){
				this.error = "An OFS message needs at least four comma-separated fields."
				return
			}
			var header = parts.shift()
			var options = parts.shift()
			var credentials = parts.shift()
			var recordId = this.decodeId(parts.shift())
			var rawData = parts.join(",")
			var optionParts = options.split("/")
			var credentialParts = credentials.split("/")
			var isEnquiry = header.toUpperCase() === "ENQUIRY.SELECT"
			var hasReplacementTokens = /%\?%|%\^%|%\|%|'_'/.test(rawData)
			var hasReplaceFlag = credentialParts[credentialParts.length - 1] === "1"

			this.parsed = {
				type: isEnquiry ? "Enquiry request" : "Transaction request",
				application: header,
				version: optionParts[0] || "",
				function: optionParts[1] || "",
				process: optionParts[2] || "",
				gts: optionParts[3] || "",
				auth: optionParts[4] || "",
				replace: hasReplaceFlag ? "Yes" : "No",
				replacementChar: hasReplacementTokens ? "Detected" : "Not detected",
				username: credentialParts[0] || "",
				password: credentialParts[1] || "",
				company: credentialParts[2] || "",
				recordId: recordId,
				data: this.decodeData(rawData)
			}
		}
	}
})

var vm = new Vue({
	el: "#app",
	data: {
		loaded:false
	}
})

var loadLag = function(){
	vm.loaded = true
}
setTimeout(loadLag,200)

new Clipboard(".clipBtn")