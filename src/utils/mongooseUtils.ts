import {
  Document,
  isValidObjectId,
  Model as MongooseModel,
  MongooseUpdateQueryOptions,
  ObjectId,
  PopulateOptions,
  QueryOptions,
  SortOrder,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  UpdateWriteOpResult,
} from "mongoose";
import { sanitizeQuery } from "./sanitizeQuery";

// Find
export const findByIdAndSanitize = async <T extends Document<any, any, any>>(
  model: MongooseModel<T>,
  id: string | ObjectId,
  populate?: PopulateOptions | (PopulateOptions | string)[],
  sort?: { sort?: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | undefined | null; options?: { override?: boolean } }
): Promise<T | null> => {
  if (!isValidObjectId(id)) {
    console.warn(`Invalid ObjectId provided for model ${model.modelName}: ${id}`);
    return null;
  }

  const rawQuery = populate
    ? await model.findById(id).populate(populate).sort(sort?.sort, sort?.options)
    : await model.findById(id).sort(sort?.sort, sort?.options);

  if (!rawQuery) return null;
  return sanitizeQuery(rawQuery) as T;
};

export const findOneAndSanitize = async <T extends Document<any, any, any>>(
  model: MongooseModel<T>,
  filter: any,
  populate?: PopulateOptions | (PopulateOptions | string)[],
  sort?: { sort?: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | undefined | null; options?: { override?: boolean } }
): Promise<T | null> => {
  const rawQuery = populate
    ? await model.findOne(filter).populate(populate).sort(sort?.sort, sort?.options)
    : await model.findOne(filter).sort(sort?.sort, sort?.options);

  if (!rawQuery) return null;
  return sanitizeQuery(rawQuery) as T;
};

export const findAndSanitize = async <T extends Document<any, any, any>>(
  model: MongooseModel<T>,
  filter: any,
  populate?: PopulateOptions | (PopulateOptions | string)[],
  sort?: { sort?: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | undefined | null; options?: { override?: boolean } }
): Promise<T[] | null> => {
  const rawQuery = populate
    ? await model.find(filter).populate(populate).sort(sort?.sort, sort?.options)
    : await model.find(filter).sort(sort?.sort, sort?.options);

  if (!rawQuery) return null;
  return sanitizeQuery(rawQuery) as T[];
};

// Update
export const updateByIdAndSanitize = async <T extends Document<any, any, any>>(
  model: MongooseModel<T>,
  id: string | ObjectId,
  update: UpdateQuery<T>,
  options?: QueryOptions,
  populate?: PopulateOptions | (PopulateOptions | string)[],
  sort?: { sort?: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | undefined | null; options?: { override?: boolean } }
): Promise<T | null> => {
  if (!isValidObjectId(id)) {
    console.warn(`Invalid ObjectId provided for model ${model.modelName}: ${id}`);
    return null;
  }

  const rawQuery = populate
    ? await model.findByIdAndUpdate(id, update, options).populate(populate).sort(sort?.sort, sort?.options)
    : await model.findByIdAndUpdate(id, update, options).sort(sort?.sort, sort?.options);

  if (!rawQuery) return null;
  return sanitizeQuery(rawQuery) as T;
};

export const updateOneAndSanitize = async <T extends Document<any, any, any>>(
  model: MongooseModel<T>,
  filter: any,
  update: UpdateQuery<T>,
  options?: QueryOptions,
  populate?: PopulateOptions | (PopulateOptions | string)[],
  sort?: { sort?: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | undefined | null; options?: { override?: boolean } }
): Promise<T | null> => {
  const rawQuery = populate
    ? await model.findOneAndUpdate(filter, update, options).populate(populate).sort(sort?.sort, sort?.options)
    : await model.findOneAndUpdate(filter, update, options).sort(sort?.sort, sort?.options);

  if (!rawQuery) return null;
  return sanitizeQuery(rawQuery) as T;
};

export const updateManyAndSanitize = async <T extends Document<any, any, any>>(
  model: MongooseModel<T>,
  filter: any,
  update: UpdateQuery<T> | UpdateWithAggregationPipeline,
  options?: MongooseUpdateQueryOptions & { sanitize?: boolean },
  populate?: PopulateOptions | (PopulateOptions | string)[],
  sort?: { sort?: string | { [key: string]: SortOrder | { $meta: any } } | [string, SortOrder][] | undefined | null; options?: { override?: boolean } }
): Promise<T[] | UpdateWriteOpResult | null> => {
  const rawQuery = await model.updateMany(filter, update, options).sort(sort?.sort, sort?.options);

  if (options && options.sanitize === undefined) options = { ...options, sanitize: true };
  if (!rawQuery) return null;
  if (!options?.sanitize) return rawQuery;

  return (await findAndSanitize(model, filter, populate)) as T[];
};

// Create
export const createAndSanitize = async <T extends Document<any, any, any>>(model: MongooseModel<T>, doc: any): Promise<T> => {
  const rawQuery = await model.create(doc);
  return sanitizeQuery(rawQuery) as T;
};
