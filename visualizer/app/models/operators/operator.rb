require 'json'

class Operator
	attr_accessor :id, :ancestors

	def initialize
		super
		initializeWithType
		@ancestors = Array.new
	end

	def addEdgeTo(otherOperator)
		otherOperator.ancestors << self
	end

	def edgeArray(depth=0)
		result = Array.new(1) { self }
		for ancestor in @ancestors
			result = ancestor.edgeArray(depth+1).concat(result)
		end
		
		return result
	end

	def edges
		result = Array.new
		for ancestor in @ancestors
			result << ([ancestor.id.to_s(), self.id.to_s()])
		end

		return result
	end

	def to_json(*a)
		as_json.to_json(*a)
	end

	def as_json(*a)
		{"type"=>@type}
	end

	# returns the json query using this operator as root node
	def getQuery
		nodes = self.edgeArray
		resultHash = {}
		operatorsHash = {}
		currentID = 0

		#build the operators
		for operator in nodes.uniq
			operator.id = currentID
			operatorsHash[operator.id] = operator
			currentID += 1
		end

		resultHash['operators'] = operatorsHash

		#ids are assigned, now loop one more time to get the right edges
		edges = Array.new()
		for operator in nodes
			edges = edges.concat(operator.edges())
		end
		resultHash['edges'] = edges unless edges.empty?

		return resultHash.to_json()
	end

	private
		def initializeWithType(type="")
			@type = type
		end
end
