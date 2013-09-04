class HashBuildOperator < Operator

	def initialize
		super
		@fields = Array.new
		@key = "groupby"
		initializeWithType("HashBuild")
	end

	def addField(field)
		@fields << field
	end

	def setKey(key)
		@key = key
	end

	def as_json(*a)
		{"type" => @type, "fields" => @fields, "key" => @key}
	end

end
