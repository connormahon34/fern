import { RawSchemas } from "@fern-api/syntax-analysis";
import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIV3, OpenAPI } from "openapi-types";
import { convertToFernType } from "./typeConverter";
import { convertToFernService } from "./serviceConverter";

export declare namespace OpenApiConverter {
    type Result = SuccessfulResult | FailedResult;

    interface SuccessfulResult {
        didSucceed: true;
        fernConfiguration: RawSchemas.RawFernConfigurationSchema;
    }

    interface FailedResult {
        didSucceed: false;
        failure: OpenApiConversionFailure;
    }
}

export enum OpenApiConversionFailure {
    FAILED_TO_PARSE_OPENAPI,
    OTHER,
}

export async function convertOpenApi(openapiFilepath: string): Promise<OpenApiConverter.Result> {
    const openApi = await SwaggerParser.parse(openapiFilepath);
    if (openApi === undefined || !isOpenApiV3(openApi)) {
        return {
            didSucceed: false,
            failure: OpenApiConversionFailure.FAILED_TO_PARSE_OPENAPI,
        };
    }
    const convertedFernConfiguration: Required<RawSchemas.RawFernConfigurationSchema> = {
        errors: {},
        imports: {},
        ids: [],
        types: {},
        services: {},
    };
    try {
        if (openApi.components !== undefined && openApi.components.schemas !== undefined) {
            for (const typeName of Object.keys(openApi.components.schemas)) {
                const typeDefinition = openApi.components.schemas[typeName];
                if (typeDefinition !== undefined && isSchemaObject(typeDefinition)) {
                    const fernConversionResult = convertToFernType(typeName, typeDefinition);
                    for (const [convertedTypeName, convertedTypeDefinition] of Object.entries(
                        fernConversionResult.typeDefinitions
                    )) {
                        convertedFernConfiguration.types[convertedTypeName] = convertedTypeDefinition;
                    }
                }
            }
        }
        const fernService = convertToFernService(openApi.paths, openApi.components?.securitySchemes);
        convertedFernConfiguration.services["http"] = {};
        convertedFernConfiguration.services["http"]["OpenApiService"] = fernService;
        return {
            didSucceed: true,
            fernConfiguration: convertedFernConfiguration,
        };
    } catch (e) {
        console.log(e);
        return {
            didSucceed: false,
            failure: OpenApiConversionFailure.OTHER,
        };
    }
}

function isSchemaObject(
    typeDefinition: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): typeDefinition is OpenAPIV3.SchemaObject {
    return !(typeDefinition as OpenAPIV3.ReferenceObject).$ref !== undefined;
}

function isOpenApiV3(openApi: OpenAPI.Document): openApi is OpenAPIV3.Document {
    return (openApi as OpenAPIV3.Document).openapi !== undefined;
}
