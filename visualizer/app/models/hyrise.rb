require 'net/http'

require 'operators/operator.rb'
require 'operators/metadata.rb'
require 'operators/tableload.rb'
require 'operators/projectionscan.rb'
require 'operators/simpletablescan.rb'
require 'operators/groupbyscan.rb'
require 'operators/hashbuild.rb'
require 'operators/sortscan.rb'

class Hyrise

	HYRISE_DEFAULT_URL = URI('http://localhost:5000/')

	def loadTable(tablename, tablefile)
		loadOperator = TableLoadOperator.new
		loadOperator.setTableName tablename
		loadOperator.setTableFileName tablefile

		return executeQuery loadOperator.getQuery
	end

	def getTables
		metaOperator = MetaDataOperator.new

		tables = Hash.new
		result = executeQuery metaOperator.getQuery

		unless result['rows'].nil?
			result['rows'].each do | row |
				table = { name: row.second, type: row.third}

				#get the smalles and the highest value for each column if type is 0 or 1
				if row.third < 2
					projectionOperator = ProjectionScanOperator.new

					projectionOperator.addInput row.first
					projectionOperator.addField row.second

					sortscanOperator = SortScanOperator.new
					sortscanOperator.addField 0 #row.second

					projectionOperator.addEdgeTo sortscanOperator

					data = executeQuery sortscanOperator.getQuery

					unless data['rows'].nil?
						table[:min] = data['rows'].first.first
						table[:max] = data['rows'].last.first
					end
				end

				(tables[row.first] ||= []) << table
			end
		end


		return tables
	end

	# get the meta data for a specific table. This function assumes that the table is already loaded.
	def getColumnsForTable(table)
		metaOperator = MetaDataOperator.new
		metaOperator.addInput table

		return executeQuery metaOperator.getQuery
	end

	def getContentForSeries(series, xaxis, filters)

		content = Array.new
		series.each do | index, serie |
			finalResult = Hash.new
			column = serie['yColumn']

			queryOperator = composeFilterOperator filters
			queryOperator = composeLocalFilterOperator column, queryOperator
			queryOperator = composeProjectionOperator xaxis, column, queryOperator
			queryOperator = composeAggregationOperator xaxis, column, queryOperator

			result = executeQuery queryOperator.getQuery

			unless result['rows'].nil?
				if xaxis['type'].to_i < 2
					result['rows'].each do | row |
						(finalResult['data'] ||= []) << [row.first, row.second]
					end
				else
					categories = []
					result['rows'].each do | row |
						categories << row.first
						(finalResult['data'] ||= []) << row.second
					end
					finalResult['categories'] = categories.uniq
				end
				finalResult['axis'] = serie['axis']
				finalResult['id'] = column['id']
				finalResult['name'] = result['header'].second
				finalResult['name'][xaxis['column']] = column['column'] if finalResult['name'].include? xaxis["column"]  #replace names like COUNT(xaxis) with COUNT(yaxis)
			end

			content.push finalResult 
		end

		return content
	end

	protected

		def executeQuery(query, url = HYRISE_DEFAULT_URL)
			req = Net::HTTP::Post.new(url.path)
			req.set_form_data({:query=> query, :limit => 0})

			begin

				response = Net::HTTP.new(url.host, url.port).start {|http|
			      http.read_timeout = nil
			      http.request(req)
			    }
				
			rescue Exception => e
				return {"error" => "Server not reachable"}
			end

		    response_body = response.body
		    json = JSON.parse(response_body)

		    jj json
		    json
		end

		def composeFilterOperator(filters)

			returnOperator = nil
			return returnOperator if filters.nil?
			
			filters.each do | index, filterColumn |
				returnOperator = composeLocalFilterOperator(filterColumn, returnOperator)
			end

			return returnOperator
		end

		def composeLocalFilterOperator(column, currentOperator)

			returnOperator = currentOperator

			if !column['min'].nil?				
				minFilterOperator = SimpleTableScanOperator.new
				
				minFilterOperator.addPredicate(SCAN_TYPE::OR)

				minFilterOperator.addPredicate(SCAN_TYPE::GT,0,column['column'], column['type'].to_i,column['min'].to_i)
				minFilterOperator.addPredicate(SCAN_TYPE::EQ,0,column['column'], column['type'].to_i,column['min'].to_i)

				if returnOperator.nil? 
					minFilterOperator.addInput column["table"]
				else
					returnOperator.addEdgeTo minFilterOperator
				end
				returnOperator = minFilterOperator
			end
			if !column['max'].nil?
				maxFilterOperator = SimpleTableScanOperator.new

				maxFilterOperator.addPredicate(SCAN_TYPE::OR)

				maxFilterOperator.addPredicate(SCAN_TYPE::LT,0,column['column'], column['type'].to_i,column['max'].to_i)
				maxFilterOperator.addPredicate(SCAN_TYPE::EQ,0,column['column'], column['type'].to_i,column['max'].to_i)

				if returnOperator.nil?
					maxFilterOperator.addInput column["table"]
				else 
					returnOperator.addEdgeTo maxFilterOperator
				end
				returnOperator = maxFilterOperator
			end

			return returnOperator
		end

		def composeProjectionOperator(xaxis, column, currentOperator)

			projectionOperator = ProjectionScanOperator.new

			projectionOperator.addField xaxis["column"]
			projectionOperator.addField column["column"]

			if !currentOperator.nil? 
				currentOperator.addEdgeTo projectionOperator
			else
				projectionOperator.addInput column["table"]
			end

			return projectionOperator
		end

		def composeAggregationOperator(xaxis, column, currentOperator)
			if column["aggregation"] != 'none'
				groupOperator = GroupByScanOperator.new
				hashBuildOperator = HashBuildOperator.new

				hashBuildOperator.addField xaxis["column"]

				groupOperator.addField xaxis["column"]

				case column["aggregation"]
					when 'count'
						groupOperator.addFunction(1, xaxis["column"])
					when 'average'
						groupOperator.addFunction(2, column["column"])
					when 'sum'
						groupOperator.addFunction(0, column["column"])
					else
						groupOperator.addFunction(1, xaxis["column"])
				end

				currentOperator.addEdgeTo(hashBuildOperator)
				currentOperator.addEdgeTo(groupOperator)
				hashBuildOperator.addEdgeTo(groupOperator)

				sortOperator = SortScanOperator.new
				sortOperator.addField 0

				groupOperator.addEdgeTo sortOperator

				return sortOperator
			end 

			return currentOperator
		end
end