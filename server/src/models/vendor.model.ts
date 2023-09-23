import {Model, Column, Table, HasMany} from "sequelize-typescript";

@Table
class VendorModel extends Model {
    @Column
    name!: string;

   
}
